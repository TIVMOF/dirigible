/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.engine.cms.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.eclipse.dirigible.commons.api.helpers.ContentTypeHelper;
import org.eclipse.dirigible.commons.config.ResourcesCache;
import org.eclipse.dirigible.commons.config.ResourcesCache.Cache;
import org.eclipse.dirigible.components.engine.cms.CmisDocument;
import org.eclipse.dirigible.components.engine.cms.CmisObject;
import org.eclipse.dirigible.components.engine.cms.CmisSessionFactory;
import org.eclipse.dirigible.components.engine.cms.ObjectType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * The Class CmsService.
 */
@Service
@RequestScope
public class CmsService {

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(CmsService.class);

    /** The Constant WEB_CACHE. */
    private static final Cache WEB_CACHE = ResourcesCache.getWebCache();

    /** The request. */
    @Autowired
    private HttpServletRequest request;

    /**
     * Gets the document by path.
     *
     * @param path the path
     * @return the document by path
     */
    public ResponseEntity getDocumentByPath(String path) {
        if (isCached(path)) {
            return sendResourceNotModified();
        }

        String errorMessage = "Document not found or cannot be loaded: " + path;
        CmisObject cmisObject;
        try {
            cmisObject = CmisSessionFactory.getSession()
                                           .getObjectByPath(path);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage);
        }
        ObjectType type = cmisObject.getType();
        if (ObjectType.DOCUMENT.equals(type) && cmisObject instanceof CmisDocument) {
            String contentType = ContentTypeHelper.getContentType(ContentTypeHelper.getExtension(path));
            byte[] content;
            try {
                content = IOUtils.toByteArray(((CmisDocument) cmisObject).getContentStream()
                                                                         .getInputStream());
            } catch (IOException e) {
                logger.error(e.getMessage(), e);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage);
            }
            if (content == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested document not found.");
            }
            return sendResource(path, ContentTypeHelper.isBinary(contentType), content, contentType);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested document not found.");
    }

    /**
     * Gets the document by path.
     *
     * @param path the path
     * @return the document by path
     */
    public byte[] getDocument(String path) {
        String errorMessage = "Document not found or cannot be loaded: " + path;
        CmisObject cmisObject;
        try {
            cmisObject = CmisSessionFactory.getSession()
                                           .getObjectByPath(path);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage);
        }
        ObjectType type = cmisObject.getType();
        if (ObjectType.DOCUMENT.equals(type) && cmisObject instanceof CmisDocument) {
            String contentType = ContentTypeHelper.getContentType(ContentTypeHelper.getExtension(path));
            byte[] content;
            try {
                content = IOUtils.toByteArray(((CmisDocument) cmisObject).getContentStream()
                                                                         .getInputStream());
            } catch (IOException e) {
                logger.error(e.getMessage(), e);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, errorMessage);
            }
            if (content == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested document not found.");
            }
            return content;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested document not found.");
    }

    /**
     * Checks existance of the resource by path.
     *
     * @param path the path
     * @return the true if exists and false otherwise
     */
    public boolean existDocument(String path) {
        CmisObject cmisObject;
        try {
            cmisObject = CmisSessionFactory.getSession()
                                           .getObjectByPath(path);
        } catch (IOException e) {
            return false;
        }
        ObjectType type = cmisObject.getType();
        if (ObjectType.DOCUMENT.equals(type) && cmisObject instanceof CmisDocument) {
            return true;
        }
        return false;
    }

    /**
     * Send resource not modified.
     *
     * @return the response
     */
    private ResponseEntity sendResourceNotModified() {
        final HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add("ETag", getTag());
        return new ResponseEntity(httpHeaders, HttpStatus.NOT_MODIFIED);
    }

    /**
     * Send resource.
     *
     * @param path the path
     * @param isBinary the is binary
     * @param content the content
     * @param contentType the content type
     * @return the response
     */
    private ResponseEntity sendResource(String path, boolean isBinary, byte[] content, String contentType) {
        String tag = cacheResource(path);
        final HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.valueOf(contentType));
        httpHeaders.add("Cache-Control", "public, must-revalidate, max-age=0");
        httpHeaders.add("ETag", tag);
        if (isBinary) {
            return new ResponseEntity(content, httpHeaders, HttpStatus.OK);
        }
        return new ResponseEntity(new String(content, StandardCharsets.UTF_8), httpHeaders, HttpStatus.OK);
    }

    /**
     * Cache resource.
     *
     * @param path the path
     * @return the string
     */
    private String cacheResource(String path) {
        String tag = WEB_CACHE.generateTag();
        WEB_CACHE.setTag(path, tag);
        return tag;
    }

    /**
     * Checks if is cached.
     *
     * @param path the path
     * @return true, if is cached
     */
    private boolean isCached(String path) {
        String tag = getTag();
        String cachedTag = WEB_CACHE.getTag(path);
        return tag != null && tag.equals(cachedTag);

    }

    /**
     * Gets the tag.
     *
     * @return the tag
     */
    private String getTag() {
        return request.getHeader("If-None-Match");
    }

}
