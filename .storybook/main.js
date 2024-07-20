module.exports = {
    "stories": [
        "../src/**/*.stories.mdx",
        "../src/**/*.stories.@(js|jsx|ts|tsx)"
    ],
    "addons": [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        '@storybook/addon-docs',
    ],
    "framework": {
        name: "@storybook/react-webpack5",
        options: {},
    },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                    },
                },
                {
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true, // Disable type checking
                    },
                },
            ],
        });

        config.resolve.extensions.push('.ts', '.tsx');

        return config;
    },
}