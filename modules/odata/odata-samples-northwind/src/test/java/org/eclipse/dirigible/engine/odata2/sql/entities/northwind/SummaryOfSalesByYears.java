/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.dirigible.engine.odata2.sql.entities.northwind;

import java.util.Date;

import org.apache.olingo.odata2.api.annotation.edm.EdmEntitySet;
import org.apache.olingo.odata2.api.annotation.edm.EdmEntityType;
import org.apache.olingo.odata2.api.annotation.edm.EdmFacets;
import org.apache.olingo.odata2.api.annotation.edm.EdmKey;
import org.apache.olingo.odata2.api.annotation.edm.EdmProperty;
import org.apache.olingo.odata2.api.annotation.edm.EdmType;

/**
 * The Class SummaryOfSalesByYears.
 */
@EdmEntityType(name = "Summary_of_Sales_by_Year")
@EdmEntitySet(name = "Summary_of_Sales_by_Years", container = "NorthwindEntities")
public class SummaryOfSalesByYears {

    /** The shipped date. */
    @EdmProperty(type = EdmType.DATE_TIME)
    private Date shippedDate;

    /** The order id. */
    @EdmKey
    @EdmProperty(name = "OrderID", facets = @EdmFacets(nullable = false))
    private Integer orderId;

    /** The subtotal. */
    @EdmProperty(type = EdmType.DECIMAL, facets = @EdmFacets(precision = 19, scale = 4))
    private Double subtotal;

}
