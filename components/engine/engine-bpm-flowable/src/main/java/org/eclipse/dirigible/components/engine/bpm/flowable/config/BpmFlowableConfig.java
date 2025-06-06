/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.engine.bpm.flowable.config;

import org.eclipse.dirigible.components.engine.bpm.BpmProvider;
import org.flowable.engine.ProcessEngine;
import org.flowable.spring.boot.actuate.endpoint.ProcessEngineEndpoint;
import org.flowable.spring.boot.actuate.info.FlowableInfoContributor;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration;
import org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The Class BpmFlowableConfig.
 */
@Configuration
@EnableAutoConfiguration(exclude = {LiquibaseAutoConfiguration.class, TaskExecutionAutoConfiguration.class})

public class BpmFlowableConfig {

    @Bean("BPM_PROVIDER")
    public BpmProvider getBpmProvider(BpmProviderFlowable bpmProviderFlowable) {
        return bpmProviderFlowable;
    }

    /**
     * Enable actuator flowable endpoint
     */
    @Bean
    ProcessEngineEndpoint processEngineEndpoint(BpmProviderFlowable bpmProviderFlowable) {
        ProcessEngine engine = bpmProviderFlowable.getProcessEngine();
        return new ProcessEngineEndpoint(engine);
    }

    @Bean
    FlowableInfoContributor flowableInfoContributor() {
        return new FlowableInfoContributor();
    }

}
