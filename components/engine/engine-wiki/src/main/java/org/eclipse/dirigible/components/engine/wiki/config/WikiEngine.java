/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.engine.wiki.config;

import org.eclipse.dirigible.components.base.artefact.Engine;
import org.springframework.stereotype.Component;

/**
 * The Class WikiEngine.
 */
@Component
public class WikiEngine implements Engine {

    /**
     * Gets the name.
     *
     * @return the name
     */
    @Override
    public String getName() {
        return "Wiki (Markdown & Confluence)";
    }

    /**
     * Gets the provider.
     *
     * @return the provider
     */
    @Override
    public String getProvider() {
        return "Eclipse Dirigible";
    }

}
