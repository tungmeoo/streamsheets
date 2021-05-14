/* eslint-disable react/jsx-no-duplicate-props */
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

/* eslint-disable react/prop-types, react/forbid-prop-types */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import {
	AppBar, IconButton, Paper, Slide,
	TextField
	// Typography
} from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import JSG from '@cedalo/jsg-ui';
import PropTypes from 'prop-types';

import * as Actions from '../../actions/actions';
import { graphManager } from '../../GraphManager';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
// import {intl} from "../../helper/IntlGlobalProvider";

const styles = {
	icon: {
		color: 'white'
	},
	underline: {
		'&::before': {
			borderColor: 'white'
		},
		'&::after': {
			borderColor: 'white'
		},
		'&&&&:hover:before': {
			borderBottom: '2px solid white'
		}
	}
};

export class LayoutSectionProperties extends Component {
	static propTypes = {
		dummy: PropTypes.string
	};

	static defaultProps = {
		dummy: ''
	};

	state = {
		minSize: 1000,
		size: 1000,
		sizeMode: 'auto',
	};

	componentDidMount() {
		JSG.NotificationCenter.getInstance().register(
			this,
			JSG.SelectionProvider.SELECTION_CHANGED_NOTIFICATION,
			'onGraphSelectionChanged',
		);
	}

	componentWillUnmount() {
		JSG.NotificationCenter.getInstance().unregister(this, JSG.SelectionProvider.SELECTION_CHANGED_NOTIFICATION);
	}

	onGraphSelectionChanged() {
		const viewer = graphManager.getGraphViewer();
		const context = viewer.getSelectionProvider().getSelectionContext();
		if (context && (context.obj === 'layoutsectioncolumn' || context.obj === 'layoutsectionrow')) {
			const data = this.getSection();
			this.setState({
				minSize: data.minSize,
				size: data.size,
				sizeMode: data.sizeMode
			});
		} else {
			this.props.setAppState({showLayoutSectionProperties: false});
		}
	}

	getItem() {
		const viewer = graphManager.getGraphViewer();
		return viewer.getSelectionProvider().getFirstSelection().getModel();
	}

	isRowSection() {
		const viewer = graphManager.getGraphViewer();
		const context = viewer.getSelectionProvider().getSelectionContext();
		return (context && context.obj === 'layoutsectionrow');
	}

	getSection() {
		const viewer = graphManager.getGraphViewer();
		const context = viewer.getSelectionProvider().getSelectionContext();
		if (context && (context.obj === 'layoutsectioncolumn' || context.obj === 'layoutsectionrow')) {
			return context.data;
		}
		return undefined;
	}

	// onPlotDoubleClicked(notification) {
	// 	if (notification.object && notification.object.open) {
	// 		this.props.setAppState({showLayoutSectionProperties: true});
	// 	}
	//
	// 	this.onGraphSelectionChanged();
	// }
	//
	handleClose = () => {
		this.props.setAppState({ showLayoutSectionProperties: false });
	};

	handleSize = (event) => {
		this.setState({size: event.target.value});
	};

	handleSizeBlur = (event) => {
		const data = this.getSection();
		data.size = Number(event.target.value);
		this.execute(data);
	};

	execute(data) {
		const viewer = graphManager.getGraphViewer();
		const context = viewer.getSelectionProvider().getSelectionContext();
		if (context && (context.obj === 'layoutsectioncolumn' || context.obj === 'layoutsectionrow')) {
			const node = this.getItem().getParent();
			const row = context.obj === 'layoutsectionrow';
			const index = row ? node.rowData.indexOf(data) : node.columnData.indexOf(data);
			const cmd = new JSG.SetLayoutSectionCommand(node,
				index,
				row,
				data.size,
				data.minSize,
				data.sizeMode);
			graphManager.synchronizedExecute(cmd);
		}
	}

	handleMinimumSize = (event) => {
		this.setState({minSize: event.target.value});
	};

	handleMinimumSizeBlur = (event) => {
		const data = this.getSection();
		data.minSize = Number(event.target.value);
		this.execute(data);
	};

	handleSizeMode = (event) => {
		const data = this.getSection();
		data.sizeMode = event.target.value;
		this.setState({sizeMode: event.target.value});
		this.execute(data);

	};

	render() {
		if (!this.props.showLayoutSectionProperties) {
			return <div />;
		}
		return (
			<Slide direction="left" in={this.props.showLayoutSectionProperties} mountOnEnter unmountOnExit>
				<Paper
					square
					elevation={0}
					style={{
						border: '1px solid grey',
						position: 'absolute',
						top: '-1px',
						right: '0px',
						width: '300px',
						height: '100%',
						visibility: this.props.showLayoutSectionProperties ? 'visible' : 'hidden',
						overflowX: 'hidden',
						overflowY: 'auto',
						zIndex: '1250'
					}}
				>
					<AppBar
						color="inherit"
						elevation={0}
						id={this.props.dummy}
						style={{
							backgroundColor: 'dimgrey',
							width: '100%',
							height: '48px',
							display: 'flex',
							flexDirection: 'row',
							position: 'relative',
							justifyContent: 'space-between'
						}}
					>
						<Typography
							style={{
								padding: '12px 0px 12px 8px',
								display: 'inline-block',
								fontSize: '12pt',
								color: 'white',
							}}
						>
							<FormattedMessage id="LayoutSection" defaultMessage="Layout Section Settings" />
						</Typography>
						<IconButton
							style={{
								display: 'inline',
								color: 'white',
								padding: '12px'
							}}
							onClick={() => this.handleClose()}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					</AppBar>
					<div
						style={{
							position: 'relative',
							margin: '8px'
						}}
					>
						<TextField
							variant="outlined"
							size="small"
							fullWidth
							margin="normal"
							select
							value={this.state.sizeMode}
							onChange={event => this.handleSizeMode(event)}
							label={
								<FormattedMessage id="GraphItemProperties.SizeMode" defaultMessage="Size" />
							}
						>
							<MenuItem value="auto">
								<FormattedMessage id="GraphItemProperties.Automatic" defaultMessage="Automatic"/>
							</MenuItem>
							<MenuItem value="metric">
								<FormattedMessage id="GraphItemProperties.Metric" defaultMessage="Metric"/>
							</MenuItem>
							{this.isRowSection() ? null : (
								<MenuItem value="relative">
									<FormattedMessage id="GraphItemProperties.Relative" defaultMessage="Relative to Container Size"/>
								</MenuItem>
							)}
						</TextField>
						<TextField
							variant="outlined"
							size="small"
							margin="normal"
							fullWidth
							value={this.state.size}
							onChange={event => this.handleSize(event)}
							onBlur={event => this.handleSizeBlur(event)}
							label={
							<FormattedMessage id="GraphItemProperties.Width" defaultMessage="Width" />}
						/>
						<TextField
							variant="outlined"
							size="small"
							fullWidth
							margin="normal"
							value={this.state.minSize}
							onChange={event => this.handleMinimumSize(event)}
							onBlur={event => this.handleMinimumSizeBlur(event)}
							label={
								<FormattedMessage id="GraphItemProperties.MinimumWidth" defaultMessage="Minimum Width" />}
						/>
					</div>
				</Paper>
			</Slide>
		);
	}
}

function mapStateToProps(state) {
	return {
		showLayoutSectionProperties: state.appState.showLayoutSectionProperties
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ ...Actions }, dispatch);
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(LayoutSectionProperties));

