/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.components.base.callable;

/**
 * The Interface CallableResultAndException.
 *
 * @param <Result> the generic type
 */
@FunctionalInterface
public interface CallableResultAndException<Result, Exc extends Throwable> {

    /**
     * Call.
     *
     * @return the result
     * @throws Exc the exception
     */
    Result call() throws Exc;
}
