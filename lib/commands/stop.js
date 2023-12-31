'use strict';
/**
 * External dependencies
 */
const podmanCompose = require( '../podman-compose' );

/**
 * Internal dependencies
 */
const initConfig = require( '../init-config' );

/**
 * Stops the development server.
 *
 * @param {Object}  options
 * @param {Object}  options.spinner A CLI spinner which indicates progress.
 * @param {boolean} options.debug   True if debug mode is enabled.
 */
module.exports = async function stop( { spinner, debug } ) {
	const { dockerComposeConfigPath } = await initConfig( {
		spinner,
		debug,
	} );

	spinner.text = 'Stopping WordPress.';

	await podmanCompose.down( {
		config: dockerComposeConfigPath,
		log: debug,
	} );

	spinner.text = 'Stopped WordPress.';
};
