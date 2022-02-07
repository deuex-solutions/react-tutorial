import styled from 'styled-components';
import * as hx from './../Utils';

const Guide = styled.div`
  --reactour-accent: ${props => props.accentColor};
  ${props =>
    props.defaultStyles
      ? `
  max-width: 400px;
  min-width: 150px;
  padding-right: 40px;
  border-radius: ${10}px;
  background-color: #fff;
  padding: 24px 30px;
  box-shadow: 0 0.5em 3em rgba(0, 0, 0, 0.3);
  color: inherit;
  `
      : ''}
  position: fixed;
  transition: top 0.3s, left 0.3s;
  top: ${props => props.coords.top};
  left: ${props => props.coords.left};

  z-index: 1000000;

  &::after {
    background: #fff;
    position: absolute;
    height: 0;
    width: 0;
    margin-left: -14px;
    content: "";
    border: 10px solid #fff;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    ${props => {
      switch (props.coords.arrowPosition) {
        case "left":
          return `
          left: 4px;
          top: 40%;
        `;
        case "right":
          return `
          right: -10px;
          top: 40%;
        `;
        case "bottom":
          return `
          left: 50%;
          bottom: -10px;
        `;
        case "top":
        default:
          return `
            left: 50%;
            top: -10px;
          `;
      }
    }}
  }
`;

export default Guide;