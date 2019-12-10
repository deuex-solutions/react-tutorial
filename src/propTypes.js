import PropTypes from 'prop-types';

export const propTypes = {
    steps: PropTypes.arrayOf(
        PropTypes.shape({
            selector: PropTypes.string,
            content: PropTypes.oneOfType([
                PropTypes.node,
                PropTypes.element,
                PropTypes.func,
              ]).isRequired,
            position: PropTypes.oneOfType([
                PropTypes.arrayOf(PropTypes.number),
                PropTypes.oneOf(['top', 'right', 'bottom', 'left', 'center']),
            ]),
            dropSelector: PropTypes.string,
            actionType: PropTypes.oneOf(['click', 'dblclick', 'typing', 'dragdrop','dragwithmove', 'custom', 'wait']),
            userTypeText: PropTypes.string,
            waitTimer: PropTypes.number,
            beforeStep: PropTypes.func,
            afterStep: PropTypes.func
        })
    )
}

export const defaultProps = {
  showNavigation: true,
  showNavigationNumber: true,
  showButtons: true,
  showNumber: true,
  startAt: 0,
  scrollDuration: 1,
  maskSpace: 10,
  stepWaitTimer: 0,
  disableInteraction: false,
  rounded: 0,
  accentColor: '#007aff',
  closeWithMask: true,
  maskColor: '#000'
}