const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const { resolve: resolveRequest } = require('metro-resolver')

const config = getDefaultConfig(__dirname)
const projectRoot = __dirname
const scaledRnEntry = path.resolve(projectRoot, 'src/lib/react-native-scaled.ts')

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  buffer: require.resolve('buffer/'),
  'react-native-original': path.resolve(projectRoot, 'node_modules/react-native'),
}

const defaultResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-original') {
    return resolveRequest(context, 'react-native', platform)
  }

  if (
    moduleName === 'react-native' &&
    !context.originModulePath.includes(`${path.sep}node_modules${path.sep}react-native${path.sep}`)
  ) {
    return {
      filePath: scaledRnEntry,
      type: 'sourceFile',
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform)
  }

  return resolveRequest(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
