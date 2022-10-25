/*
 * Copyright (c) 2022 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and Eclipse Dirigible contributors
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.jobs.service;

import org.eclipse.dirigible.components.base.artefact.ArtefactService;
import org.eclipse.dirigible.components.jobs.domain.JobParameter;
import org.eclipse.dirigible.components.jobs.repository.JobParameterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

/**
 * The Class JobParameterService.
 */
@Service
@Transactional
public class JobParameterService implements ArtefactService<JobParameter> {
    
    /** The job parameter repository. */
    @Autowired
    private JobParameterRepository jobParameterRepository;

    /**
     * Gets the all.
     *
     * @return the all
     */
    @Override
    @Transactional(readOnly = true)
    public List<JobParameter> getAll() {
        return jobParameterRepository.findAll();
    }

    /**
     * Find all.
     *
     * @param pageable the pageable
     * @return the page
     */
    @Override
    @Transactional(readOnly = true)
    public Page<JobParameter> findAll(Pageable pageable) {
        return jobParameterRepository.findAll(pageable);
    }

    /**
     * Find by id.
     *
     * @param id the id
     * @return the job parameter
     */
    @Override
    @Transactional(readOnly = true)
    public JobParameter findById(Long id) {
        Optional<JobParameter> jobParameter = jobParameterRepository.findById(id);
        if (jobParameter.isPresent()) {
            return jobParameter.get();
        } else {
            throw new IllegalArgumentException("JobParameter with id does not exist: " + id);
        }
    }

    /**
     * Find by name.
     *
     * @param name the name
     * @return the job parameter
     */
    @Override
    @Transactional(readOnly = true)
    public JobParameter findByName(String name) {
        JobParameter filter = new JobParameter();
        filter.setName(name);
        Example<JobParameter> example = Example.of(filter);
        Optional<JobParameter> jobParameter = jobParameterRepository.findOne(example);
        if (jobParameter.isPresent()) {
            return jobParameter.get();
        } else {
            throw new IllegalArgumentException("JobParameter with name does not exist: " + name);
        }
    }

    /**
     * Save.
     *
     * @param jobParameter the job parameter
     * @return the job parameter
     */
    @Override
    public JobParameter save(JobParameter jobParameter) {
        return jobParameterRepository.saveAndFlush(jobParameter);
    }

    /**
     * Delete.
     *
     * @param jobParameter the job parameter
     */
    @Override
    public void delete(JobParameter jobParameter) {
        jobParameterRepository.delete(jobParameter);
    }
}