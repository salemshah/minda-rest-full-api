module.exports = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
        parserOpts: {
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
    },
};
