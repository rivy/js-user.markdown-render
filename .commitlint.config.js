module.exports = {
    extends: ['@commitlint/config-conventional'],
    'rules': {
        'subject-empty': [2, 'never'],
        'type-empty': [2, 'never'],
        'type-enum': [2, 'always', ['add', 'change', 'chore', 'docs', 'maint', 'fix', 'refactor', 'update', 'feat', 'feature', 'build', 'ci']]
    },
    parserPreset: {
        parserOpts: {
            headerPattern: /^^\s*(\w+[!]?)(\(\w+\))?(?:\s[-~:])?\s(.*)$$/,
            headerCorrespondence: ['type', 'scope', 'subject']
            // issuePrefixes: ['#']
        }
    }
};
