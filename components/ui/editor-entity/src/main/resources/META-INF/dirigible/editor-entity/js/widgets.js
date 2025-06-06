/*
 * Copyright (c) 2025 Eclipse Dirigible contributors
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v2.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-FileCopyrightText: Eclipse Dirigible contributors
 * SPDX-License-Identifier: EPL-2.0
 */
function addSidebarIcon(graph, sidebar, prototype, image, hint, $scope, dialogs) {
	// Function that is executed when the image is dropped on
	// the graph. The cell argument points to the cell under
	// the mousepointer if there is one.
	let funct = function (graph, evt, cell) {
		graph.stopEditing(false);

		let pt = graph.getPointForEvent(evt);

		let parent = graph.getDefaultParent();
		let model = graph.getModel();

		let isEntity = graph.isSwimlane(prototype);
		let name = null;

		if (!isEntity) {
			parent = cell;
			let pstate = graph.getView().getState(parent);

			if (parent === null || pstate === null) {
				dialogs.showAlert({
					title: 'Error',
					message: 'Drop target must be an entity.',
					type: AlertTypes.Error,
					preformatted: false,
				});
				return;
			}

			pt.x -= pstate.x;
			pt.y -= pstate.y;

			let columnCount = graph.model.getChildCount(parent) + 1;
			createNode('Property' + columnCount, prototype.style);
		} else {
			//let entitiesCount = 0;
			//let childCount = graph.model.getChildCount(parent);

			//for (let i = 0; i < childCount; i++) {
			//	if (!graph.model.isEdge(graph.model.getChildAt(parent, i))) {
			//		entitiesCount++;
			//	}
			//}
			createNode('Entity' + Math.floor((Math.random() * 100000) + 1), prototype.style);


			if (prototype.style === 'dependent') {
				$scope.$cell = graph.getSelectionCell();
				$scope.$cell.value.entityType = "DEPENDENT";
			} else if (prototype.style === 'report') {
				$scope.$cell = graph.getSelectionCell();
				$scope.$cell.value.entityType = "REPORT";
			} else if (prototype.style === 'filter') {
				$scope.$cell = graph.getSelectionCell();
				$scope.$cell.value.entityType = "FILTER";
			} else if (prototype.style === 'setting') {
				$scope.$cell = graph.getSelectionCell();
				$scope.$cell.value.entityType = "SETTING";
			} else if (prototype.style === 'copied') {
				$scope.$cell = graph.getSelectionCell();
				$scope.showCopiedEntityDialog($scope.$cell.id);
			} else if (prototype.style === 'projection') {
				$scope.$cell = graph.getSelectionCell();
				$scope.showReferDialog($scope.$cell.id);
			} else if (prototype.style === 'extension') {
				$scope.$cell = graph.getSelectionCell();
				$scope.$cell.value.entityType = "EXTENSION";
			}
		}

		function createNode(name, style) {
			if (name !== null) {
				let v1 = model.cloneCell(prototype);

				model.beginUpdate();
				try {
					v1.value.name = name;
					v1.geometry.x = pt.x;
					v1.geometry.y = pt.y;

					if (isEntity && style === 'extension') {
						v1.style = 'extension';
						v1.value.entityType = "EXTENSION";
					}
					if (!isEntity && style === 'extension') {
						v1.style = 'extensionproperty';
					}

					if (isEntity && style === 'copied') {
						v1.style = 'copied';
						v1.value.entityType = "COPIED";
					}

					if (isEntity && style === 'projection') {
						v1.style = 'projection';
						v1.value.entityType = "PROJECTION";
					}
					if (!isEntity && style === 'projection') {
						v1.style = 'projectionproperty';
					}

					var memento = undefined;
					if (parent.geometry && parent.geometry.width) {
						memento = parent.geometry.width;
					}

					graph.addCell(v1, parent);

					if (memento) {
						parent.geometry.width = memento;
					}

					if (isEntity) {
						v1.geometry.alternateBounds = new mxRectangle(0, 0, v1.geometry.width, v1.geometry.height);
						if (style !== 'projection') {
							if (v1.children && v1.children.length > 0) {
								if (!v1.children[0].value.isSQL) {
									v1.children[0].value.name = 'Id';
								}
							}
						} else {
							if (v1.children && v1.children.length > 0) {
								if (!v1.children[0].value.isSQL) {
									v1.children[0].value.name = 'Id';
								}
							}
						}

						v1.value.type = 'Entity';
					}
				} finally {
					model.endUpdate();
				}

				graph.setSelectionCell(v1);
			}
		}

	};

	let img = document.createElement('i');
	img.setAttribute('class', `mx-sidebar-icon ${image}`);
	img.title = hint;
	sidebar.appendChild(img);

	// Creates the image which is used as the drag icon (preview)
	let dragImage = img.cloneNode(true);
	let ds = mxUtils.makeDraggable(img, graph, funct, dragImage);

	// Adds highlight of target entities for properties
	ds.highlightDropTargets = true;
	ds.getDropTarget = function (graph, x, y) {
		if (graph.isSwimlane(prototype)) {
			return null;
		}
		let cell = graph.getCellAt(x, y);

		if (graph.isSwimlane(cell)) {
			return cell;
		}
		let parent = graph.getModel().getParent(cell);

		if (graph.isSwimlane(parent)) {
			return parent;
		}
	};
}

function configureStylesheet(graph) {
	let style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	//style[mxConstants.STYLE_INDICATOR_COLOR] = 'var(--font_color, #303030)';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--font_color, #303030)';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 0;
	style[mxConstants.STYLE_SPACING_LEFT] = '4';
	style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
	style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
	graph.getStylesheet().putDefaultVertexStyle(style);

	// Primary Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	//style[mxConstants.STYLE_GRADIENTCOLOR] = 'var(--modeler-entity-fill)';
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--entity-color, #3584e4)'; // 'var(--modeler-entity-header-background)';
	//style[mxConstants.STYLE_SWIMLANE_FILLCOLOR] = '#ffffff'; // 'var(--modeler-entity-background)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--entity-color, #3584e4)'; // 'var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--entity-header-color, #fff)'; // 'var(--modeler-entity-header-color)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('entity', style);

	style = graph.stylesheet.getDefaultEdgeStyle();
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--font_color, #303030)';
	style[mxConstants.STYLE_LABEL_COLOR] = 'var(--font_color, #303030)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--entity-color, #3584e4)'; // var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_EDGE] = mxEdgeStyle.EntityRelation;

	// Dependent Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--dependent-color, #2a6ab6)'; // 'var(--modeler-entity-header-background)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--dependent-color, #2a6ab6)'; // 'var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--entity-header-color, #fff)'; // 'var(--modeler-entity-header-color)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('dependent', style);

	// Report Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--report-color, #26a269)'; // 'var(--modeler-entity-header-background)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--report-color, #26a269)'; // 'var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--report-font-color, #fff)'; // 'var(--modeler-entity-header-color)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('report', style);

	// Filter Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--filter-color, #e97119)'; // 'var(--modeler-entity-header-background)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--filter-color, #e97119)'; // 'var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--filter-font-color, #fff)'; // 'var(--modeler-entity-header-color)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('filter', style);

	// Setting Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--setting-color, #708090)'; // 'var(--modeler-entity-header-background)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--setting-color, #708090)'; // 'var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--setting-font-color, #fff)'; // 'var(--modeler-entity-header-color)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '100';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('setting', style);

	// Copied Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--copied-color, #5d36ff)'; // 'var(--modeler-entity-header-background)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--copied-color, #5d36ff)'; // 'var(--modeler-entity-border)';//'#337ab7';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--entity-header-color, #fff)'; // 'var(--modeler-entity-header-color)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('copied', style);

	// Projection Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--projection-color, #a100c2)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--projection-color, #a100c2)';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--entity-header-color, #fff)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('projection', style);

	// Extension Style
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
	style[mxConstants.STYLE_FILLCOLOR] = 'var(--extension-color, #046c7a)';
	style[mxConstants.STYLE_STROKECOLOR] = 'var(--extension-color, #046c7a)';
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--entity-header-color, #fff)';
	style[mxConstants.STYLE_STROKEWIDTH] = '2';
	style[mxConstants.STYLE_STARTSIZE] = '28';
	style[mxConstants.STYLE_VERTICAL_ALIGN] = 'middle';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 1;
	style[mxConstants.STYLE_ROUNDED] = true;
	style[mxConstants.STYLE_ARCSIZE] = 4;
	// Looks better without opacity if shadow is enabled
	style[mxConstants.STYLE_OPACITY] = '80';
	style[mxConstants.STYLE_SHADOW] = 1;
	graph.getStylesheet().putCellStyle('extension', style);

	// Projection Property
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--font_color, #303030)';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 0;
	style[mxConstants.STYLE_SPACING_LEFT] = '4';
	style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
	style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
	graph.getStylesheet().putCellStyle('projectionproperty', style);

	// Extension Property
	style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
	style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
	style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
	style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
	style[mxConstants.STYLE_FONTCOLOR] = 'var(--font_color, #303030)';
	style[mxConstants.STYLE_FONTSIZE] = '12';
	style[mxConstants.STYLE_FONTSTYLE] = 0;
	style[mxConstants.STYLE_SPACING_LEFT] = '4';
	style[mxConstants.STYLE_IMAGE_WIDTH] = '48';
	style[mxConstants.STYLE_IMAGE_HEIGHT] = '48';
	graph.getStylesheet().putCellStyle('extensionproperty', style);
}

// Function to create the entries in the popupmenu
function createPopupMenu(editor, graph, menu, cell, evt) {
	if (cell !== null) {
		menu.addItem('Properties', 'list-ul', function () {
			editor.execute('properties', cell);
		}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--list");

		menu.addItem('Move up', 'arrow-up', function () {
			editor.execute('moveup', cell);
		}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--slim-arrow-up");

		menu.addItem('Move down', 'arrow-down', function () {
			editor.execute('movedown', cell);
		}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--slim-arrow-down");

		menu.addItem('Copy', 'copy', function () {
			editor.execute('copy', cell);
		}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--copy");

	}

	menu.addItem('Paste', 'paste', function () {
		editor.execute('paste', cell);
	}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--paste");

	menu.addItem('Undo', 'undo', function () {
		editor.execute('undo', cell);
	}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--undo");

	menu.addItem('Redo', 'repeat', function () {
		editor.execute('redo', cell);
	}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--redo");

	if (cell !== null) {
		menu.addItem('Delete', 'times', function () {
			editor.execute('delete', cell);
		}).firstChild.firstChild.classList.add("sap-icon", "sap-icon--delete");
	}
}
