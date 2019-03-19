module.exports = () => {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          loose: true,
        },
      ],
    ],
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-transform-object-assign',
      '@babel/plugin-transform-object-set-prototype-of-to-assign',
      'macros',
    ],
  };
};
