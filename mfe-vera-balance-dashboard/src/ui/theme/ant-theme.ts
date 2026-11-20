import { theme, type ThemeConfig } from 'antd'
import tokens from '../scss/theme/tokens.module.scss'
import inputTokens from '../scss/antd/input.module.scss'
import cardTokens from '../scss/antd/card.module.scss'
import buttonTokens from '../scss/antd/button.module.scss'
import alertTokens from '../scss/antd/alert.module.scss'

const screenMD = Number.parseFloat(tokens.breakpointMD)
const screenLG = Number.parseFloat(tokens.breakpointLG)
const screenXL = Number.parseFloat(tokens.breakpointXL)

export const antTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  cssVar: true,
  token: {
    motionDurationFast: tokens.hoverTransitionDuration,
    motionDurationMid: tokens.hoverTransitionDuration,
    motionDurationSlow: tokens.hoverTransitionDuration,
    colorPrimary: tokens.primary,
    colorError: tokens.error,
    fontFamily: tokens.fontFamily,
    fontSize: Number.parseFloat(tokens.fontSize),
    fontSizeHeading1: Number.parseFloat(tokens.h1FontSize),
    fontSizeHeading2: Number.parseFloat(tokens.h2FontSize),
    fontSizeHeading3: Number.parseFloat(tokens.h3FontSize),
    fontWeightStrong: Number.parseFloat(tokens.headingFontWeight),
    screenSMMax: screenMD - 1,
    screenMD,
    screenMDMin: screenMD,
    screenMDMax: screenLG - 1,
    screenLG,
    screenLGMin: screenLG,
    screenLGMax: screenXL - 1,
    screenXL,
    screenXLMin: screenXL,
  },
  components: {
    Alert: {
      defaultPadding: alertTokens.padding,
      withDescriptionPadding: alertTokens.padding,
    },
    Button: {
      controlHeight: Number.parseFloat(buttonTokens.height),
      paddingBlock: Number.parseFloat(buttonTokens.paddingBlock),
      paddingInline: Number.parseFloat(buttonTokens.paddingInline),
      contentLineHeight: Number.parseFloat(buttonTokens.lineHeight) / Number.parseFloat(buttonTokens.fontSize),
      primaryColor: buttonTokens.primaryColor,
      colorPrimaryHover: buttonTokens.primaryHoverColor,
    },
    Input: {
      colorBgContainerDisabled: inputTokens.disabledBackground,
      colorBorderDisabled: inputTokens.disabledBorder,
      colorTextDisabled: inputTokens.disabledText,
      lineHeight: Number.parseFloat(inputTokens.inputLineHeight) / Number.parseFloat(inputTokens.fontSize),
      lineHeightLG: Number.parseFloat(inputTokens.inputLineHeight) / Number.parseFloat(inputTokens.fontSize),
      lineWidth: Number.parseFloat(inputTokens.inputBorderWidth),
      inputFontSize: Number.parseFloat(inputTokens.fontSize),
      inputFontSizeSM: Number.parseFloat(inputTokens.fontSize),
      inputFontSizeLG: Number.parseFloat(inputTokens.fontSize),
      paddingBlock: Number.parseFloat(inputTokens.inputPaddingBlock),
      paddingBlockSM: Number.parseFloat(inputTokens.inputPaddingBlock),
      paddingBlockLG: Number.parseFloat(inputTokens.inputPaddingBlock),
      paddingInline: Number.parseFloat(inputTokens.inputPaddingInline),
      paddingInlineSM: Number.parseFloat(inputTokens.inputPaddingInline),
      paddingInlineLG: Number.parseFloat(inputTokens.inputPaddingInline),
      borderRadius: Number.parseFloat(inputTokens.inputBorderRadius),
      borderRadiusSM: Number.parseFloat(inputTokens.inputBorderRadius),
      borderRadiusLG: Number.parseFloat(inputTokens.inputBorderRadius),
      colorBorder: inputTokens.inputBorder,
      colorTextPlaceholder: inputTokens.placeholder,
      hoverBorderColor: inputTokens.primary,
      activeBorderColor: inputTokens.primary,
      activeShadow: 'none',
    },
    Card: {
      borderRadiusLG: Number.parseFloat(cardTokens.cardBorderRadius),
      bodyPadding: Number.parseFloat(cardTokens.cardPadding),
      bodyPaddingSM: Number.parseFloat(cardTokens.cardPadding),
      headerPadding: Number.parseFloat(cardTokens.cardPadding),
      headerPaddingSM: Number.parseFloat(cardTokens.cardPadding),
    },
  },
}
