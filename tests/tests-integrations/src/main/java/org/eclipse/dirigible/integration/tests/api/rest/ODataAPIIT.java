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

import io.restassured.http.ContentType;
import org.eclipse.dirigible.tests.base.IntegrationTest;
import org.eclipse.dirigible.tests.framework.restassured.RestAssuredExecutor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static io.restassured.RestAssured.given;

public class ODataAPIIT extends IntegrationTest {

    @Autowired
    private RestAssuredExecutor restAssuredExecutor;

    @Test
    void testODataMetadata() {
        restAssuredExecutor.execute( //
                () -> given().when()
                             .get("/odata/v2/$metadata")
                             .then()
                             .statusCode(200)
                             .contentType(ContentType.XML));
    }
}
