import React from 'react';
import {SvgXml} from 'react-native-svg';

const SVGXml = ({icon, width = 24, height = 33, style}) => {
  return <SvgXml xml={icon} height={height} width={width} style={style} />;
};

export default SVGXml;
