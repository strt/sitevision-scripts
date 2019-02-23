module.exports = (api) => {
  const isProduction = api.env('production');

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          loose: true,
        },
      ],
      isProduction && 'minify',
    ].filter(Boolean),
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-transform-object-assign',
      '@babel/plugin-transform-object-set-prototype-of-to-assign',
      'macros',
    ],
  };
};
