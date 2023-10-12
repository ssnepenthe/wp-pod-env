'use strict';
/**
 * External dependencies
 */
const podmanCompose = require( '../podman-compose' );
const util = require( 'util' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const inquirer = require( 'inquirer' );

/**
 * Promisified dependencies
 */
const rimraf = util.promisify( require( 'rimraf' ) );
const exec = util.promisify( require( 'child_process' ).exec );

/**
 * Internal dependencies
 */
const { loadConfig } = require( '../config' );
const { executeLifecycleScript } = require( '../execute-lifecycle-script' );

/**
 * Destroy the development server.
 *
 * @param {Object}  options
 * @param {Object}  options.spinner A CLI spinner which indicates progress.
 * @param {boolean} options.scripts Indicates whether or not lifecycle scripts should be executed.
 * @param {boolean} options.debug   True if debug mode is enabled.
 */
module.exports = async function destroy( { spinner, scripts, debug } ) {
	const config = await loadConfig( path.resolve( '.' ) );

	try {
		await fs.readdir( config.workDirectoryPath );
	} catch {
		spinner.text = 'Could not find any files to remove.';
		return;
	}

	spinner.info(
		'WARNING! This will remove Docker containers, volumes, networks, and images associated with the WordPress instance.'
	);

	const { yesDelete } = await inquirer.prompt( [
		{
			type: 'confirm',
			name: 'yesDelete',
			message: 'Are you sure you want to continue?',
			default: false,
		},
	] );

	spinner.start();

	if ( ! yesDelete ) {
		spinner.text = 'Cancelled.';
		return;
	}

	spinner.text = 'Removing podman containers and volumes.';

	await podmanCompose.down( {
		config: config.dockerComposeConfigPath,
		commandOptions: [ '--volumes', '--remove-orphans' ],
		log: debug,
	} );

	// @todo Maybe not ideal - essentially a revert of https://github.com/WordPress/gutenberg/commit/ad5f72281da94cf0764fffa172c62ee500de37bc
	const directoryHash = path.basename( config.workDirectoryPath );

	spinner.text = 'Removing podman networks.';
	await removePodmanItems( 'network', 'name', directoryHash );

	spinner.text = 'Removing podman images.';
	await removePodmanItems( 'image', 'reference', directoryHash + '*', true );

	spinner.text = 'Removing local files.';
	// Note: there is a race condition where docker compose actually hasn't finished
	// by this point, which causes rimraf to fail. We need to wait at least 2.5-5s,
	// but using 10s in case it's dependant on the machine.
	await new Promise( ( resolve ) => setTimeout( resolve, 10000 ) );
	await rimraf( config.workDirectoryPath );

	if ( scripts ) {
		await executeLifecycleScript( 'afterDestroy', config, spinner );
	}

	spinner.text = 'Removed WordPress environment.';
};

/**
 * Removes podman items, like networks or volumes, matching the given name.
 *
 * @param {string} itemType    The item type, like "volume", or "network".
 * @param {string} filter      The filtering to search using.
 * @param {string} filterValue The filtering value that we're looking for.
 * @param {bool}   force       Whether to use the --force flag.
 */
async function removePodmanItems( itemType, filter, filterValue, force = false ) {
	const { stdout: items } = await exec(
		`podman ${ itemType } ls -q --filter ${ filter }='${ filterValue }'`
	);
	if ( items ) {
		let itemsList = items
			.split( '\n' ) // TODO: use os.EOL?
			.join( ' ' );

		// @todo Need to investigate - podman seems to require force flag for images with more than one tag (regular and tests).
		await exec( `podman ${ itemType } rm ${ itemsList } ${ force ? '--force' : '' }` );
	}
}
