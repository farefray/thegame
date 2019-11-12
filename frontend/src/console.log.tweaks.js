window.debug = window.console.log.bind(window.console, '%c %s %s', 'color: brown; font-weight: bold;', ':');

window.todo = window.console.log.bind(window.console, ' %c TODO: %s %s', 'color: yellow; background-color: black;', ':');

window.warn = window.console.log.bind(window.console, ' %c %s %s %s', 'color: brown; font-weight: bold;', ':');

window.info = window.console.log.bind(window.console, '%c' + new Date().getMilliseconds() + '%s %s', 'color: yellow; font-weight: bold; background-color: brown;', ':');
