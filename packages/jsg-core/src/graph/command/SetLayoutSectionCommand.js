/********************************************************************************
 * Copyright (c) 2020 Cedalo AG
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
const AbstractItemCommand = require('./AbstractItemCommand');
const LayoutSection = require('../model/LayoutSection');

class SetLayoutSectionCommand extends AbstractItemCommand {
	static createFromObject(data = {}, { graph }) {
		let cmd;
		const item = graph.getItemById(data.itemId);
		if (item) {
			cmd = new SetLayoutSectionCommand(item, data.index, data.row, data.size, data.minSize,
				data.sizeMode, data.expandable, data.expanded).initWithObject(data);
		}
		return cmd;
	}

	constructor(item, index, row, size, minSize, sizeMode, expandable, expanded) {
		super(item);

		this._index = index;
		this._row = row;
		this._size = size;
		this._sizeMode = sizeMode;
		this._minSize = minSize;
		this._minSize = minSize;
		this._expandable = expandable;
		this._expanded = expanded;
	}

	execute() {
		const section = this._row ? this.getItem().rowData[this._index] : this.getItem().columnData[this._index];
		this._oldSection = section.copy();

		section.minSize = this._minSize;
		section.size = this._size;
		section.sizeMode = this._sizeMode;
		section.expandable = this._expandable;
		section.expanded = this._expanded;

		this.getItem().getGraph().markDirty();
	}

	undo() {
		const section = this._row ? this.getItem().rowData[this._index] : this.getItem().columnData[this._index];

		section.minSize = this._oldSection._minSize;
		section.size = this._oldSection._size;
		section.sizeMode = this._oldSection._sizeMode;
		section.expandable = this._oldSection._expandable;
		section.expanded = this._oldSection._expanded;

		this.getItem().getGraph().markDirty();
	}

	redo() {
		this.execute();
	}

	toObject() {
		const data = super.toObject();

		data.index = this._index;
		data.row = this._row;
		data.size = this._size;
		data.sizeMode = this._sizeMode;
		data.minSize = this._minSize;
		data.expandable = this._expandable;
		data.expanded = this._expanded;

		return data;
	}
}

module.exports = SetLayoutSectionCommand;
