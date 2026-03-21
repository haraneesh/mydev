process.on('uncaughtException', (err, origin) => {
    console.error('Caught exception:', err);
    console.error('Exception origin:', origin);

    
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});