/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.integration.tests.api.rest;

import org.eclipse.dirigible.commons.config.DirigibleConfig;
import org.eclipse.dirigible.tests.framework.tenant.DirigibleTestTenant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Multitenant mode must be enabled by default
 */

public class EnabledMultitenantModeIT extends TenantDeterminationIT {

    @BeforeAll
    public static void setUp() {
        DirigibleConfig.MULTI_TENANT_MODE_ENABLED.setBooleanValue(true);
    }

    @Test
    void testDefaultTenantResolution() {
        testHealthIsAccessible("localhost", null);
        testHealthIsAccessible("default.localhost", null);
    }

    @Test
    void testHostWitchDoesNotMatchTheDefaultRegexIsResolvedAsDefaultTenant() {
        testHealthIsAccessible("host-which-does-not-match-the-default-tenant-regex", null);
    }

    @Test
    void testRegisteredTenantResolution() {
        DirigibleTestTenant tenant1 = new DirigibleTestTenant("test-tenant-1");
        createTenants(tenant1);
        waitForTenantProvisioning(tenant1);

        testHealthIsAccessible(tenant1.getHost(), null);
        testHealthIsAccessible("212.39.89.114", tenant1.getHost());
    }

    @Test
    void testUnregisteredTenantResolution() {
        testHealthIsNotAccessible("unregistered-tenant.localhost", null);
        testHealthIsNotAccessible("212.39.89.114", "unregistered-tenant.localhost");
    }

}
