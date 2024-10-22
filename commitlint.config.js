module.exports = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
        parserOpts: {
            // Adjust the pattern to allow for emojis in the subject
            headerPattern: /^(MAD-\d+):\s(?<type>\w+):\s(?<subject>.+)$/,
            headerCorrespondence: ['jira', 'type', 'subject'],
        },
    },
    rules: {
        'subject-case': [0, 'never'], // Disable subject case enforcement
        'type-enum': [
            2,
            'always',
            ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert'],
        ],
        'header-max-length': [2, 'always', 100],
        // Rule to allow emojis in the subject
        'subject-full-stop': [0, 'never'],
        'subject-empty': [2, 'never'],
        'header-case': [0, 'always'],
    },
};
