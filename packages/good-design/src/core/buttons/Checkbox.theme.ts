export const theme = {
  variants: {
    "styled-blue": () => ({
      _web: {
        cursor: "auto"
      },
      _stack: {
        _web: {
          cursor: "auto"
        }
      },
      _disabled: {
        _web: {
          cursor: "auto"
        },
        opacity: 1
      },
      _checked: {
        borderColor: "primary",
        bg: "primary",
        _hover: {
          borderColor: "primary",
          bg: "primary",
          _disabled: {
            borderColor: "primary",
            bg: "primary"
          }
        }
      }
    })
  }
};
