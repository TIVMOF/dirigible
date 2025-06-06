/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.ide.git.command;

import org.eclipse.dirigible.commons.config.DirigibleConfig;
import org.eclipse.dirigible.commons.process.Piper;
import org.eclipse.dirigible.commons.process.ProcessUtils;
import org.eclipse.dirigible.components.registry.accessor.RegistryAccessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * The Class WebService.
 */
@Service
@RequestScope
public class GitCommandService {

    /** The Constant logger. */
    private static final Logger logger = LoggerFactory.getLogger(GitCommandService.class);

    private final RegistryAccessor registryAccessor;

    GitCommandService(RegistryAccessor registryAccessor) {
        this.registryAccessor = registryAccessor;
    }

    /**
     * Gets the repository root.
     *
     * @return the repository root
     */
    public String getRepositoryRoot() {
        return registryAccessor.getRepository()
                               .getParameter("REPOSITORY_ROOT_FOLDER");
    }

    /**
     * Execute command line.
     *
     * @param workingDirectory the working directory
     * @param commandLine the command line
     * @param forAdding the for adding
     * @param forRemoving the for removing
     * @param params the params
     * @return the string
     * @throws Exception the exception
     */
    public String executeCommandLine(String workingDirectory, String commandLine, Map<String, String> forAdding, List<String> forRemoving,
            Map<String, String> params) throws Exception {
        String[] args = translateCommandLine(commandLine);

        if (shouldLogCommand()) {
            logger.debug("executing command={}", commandLine); //$NON-NLS-1$
        }

        ByteArrayOutputStream out;

        ProcessBuilder processBuilder = ProcessUtils.createProcess(args);

        ProcessUtils.addEnvironmentVariables(processBuilder, forAdding);
        ProcessUtils.addEnvironmentVariables(processBuilder, params);
        ProcessUtils.removeEnvironmentVariables(processBuilder, forRemoving);

        processBuilder.directory(new File(workingDirectory));

        processBuilder.redirectErrorStream(true);

        out = new ByteArrayOutputStream();
        Process process = ProcessUtils.startProcess(args, processBuilder);
        Piper pipe = new Piper(process.getInputStream(), out);
        new Thread(pipe).start();
        try {
            int i = 0;
            boolean deadYet = false;
            do {
                Thread.sleep(ProcessUtils.DEFAULT_WAIT_TIME);
                try {
                    process.exitValue();
                    deadYet = true;
                } catch (IllegalThreadStateException e) {
                    if (++i >= ProcessUtils.DEFAULT_LOOP_COUNT) {
                        process.destroy();
                        throw new RuntimeException(
                                "Exceeds timeout - " + ((ProcessUtils.DEFAULT_WAIT_TIME / 1000) * ProcessUtils.DEFAULT_LOOP_COUNT));
                    }
                }
            } while (!deadYet);

        } catch (Exception e) {
            throw new IOException(e);
        }
        return out.toString(StandardCharsets.UTF_8);
    }

    private static String[] translateCommandLine(String commandLine) throws Exception {
        try {
            return ProcessUtils.translateCommandline(commandLine);
        } catch (Exception e) {
            throw new Exception("Failed to translate commandLine [" + commandLine + "]", e);
        }
    }

    /**
     * Should log command.
     *
     * @return true, if successful
     */
    private boolean shouldLogCommand() {
        return DirigibleConfig.EXEC_COMMAND_LOGGING_ENABLED.getBooleanValue();
    }

}
