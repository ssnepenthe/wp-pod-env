'use strict';

const dockerCompose = require( 'docker-compose' );

function buildOne(service, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.buildOne(service, options);
}

function down(options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.down(options);
}

function exec(container, command, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.exec(container, command, options);
}

function logs(services, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.logs(services, options);
}

function port(service, containerPort, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.port(service, containerPort, options);
}

function pullAll(options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.pullAll(options);
}

function run(container, command, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.run(container, command, options);
}

function upMany(services, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.upMany(services, options);
}

function upOne(service, options = {}) {
    options.executablePath = 'podman-compose';

    return dockerCompose.upOne(service, options);
}

module.exports = {
    buildOne,
    down,
    exec,
    logs,
    port,
    pullAll,
    run,
    upMany,
    upOne,
};
