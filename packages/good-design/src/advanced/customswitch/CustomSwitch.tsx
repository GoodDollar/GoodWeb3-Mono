import React, { useState } from 'react'
import { Pressable, Icon, Text, ChevronDownIcon, View, Box } from 'native-base'

import FuseIcon from '../../assets/svg/fuse.svg'
import CeloIcon from '../../assets/svg/celo.svg'
// import SwitchIcon from ' ../../assets/svg/arrow-swap.svg'

// TODO: make imports from .svg work

const SwitchIcon = () => (
  <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="m5 10.0909h14l-5.8396-5.0909" stroke="#B0B4BB"/>
    <path d="m19 13.9091h-14l5.8396 5.0909" stroke="#B0B4BB"/>
  </g>
)

const IconList: { [key: string]: string; } = {
  "Fuse": FuseIcon,
  "Celo": CeloIcon
}

const show = {
  button: {
    display: "flex",
    borderBottomLeftRadius: "0",
    borderBottomRightRadius: "0"
  },
  list: {
    "display": "flex",
    backgroundColor: '#F2F2F2',
    borderTopLeftRadius: "0",
    borderTopRightRadius: "0"
  }
}

const hide = {
  button: {
    "display": "flex",
    borderBottomLeftRadius: "2",
    borderBottomRightRadius: "2" 
  }, 
  list: {
    "display": "none",
    backgroundColor: "inherit"
  }
}

type CustomSelectBoxProps = {
  text: string,
  press: () => void,
  styles: any,
  isListItem: boolean
}

const CustomSelectBox = ({ text, press, styles, isListItem }: CustomSelectBoxProps) => (
  <>
          <Pressable
          borderColor="blue.500"
          borderWidth="1"
          borderRadius="lg"
          style={styles}
          flexDirection="row"
          onPress={press}
          w="40"
          h="16"
          p="1"
          _hover={{ bgColor: "mainDarkContrast:alpha.20" }}>
          {/* Temp workaround for loading the network svg icons */}
          <img src={IconList[text]} style={{
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            width: "30px",
            height: '48px',
            paddingLeft: '10px'
          }} />
          <Text
            textAlign="center"
            fontSize="lg"
            ml="0" w="105%"
            alignSelf="center"
            display="flex"
            pl="2"
            fontWeight="thin"
            fontFamily="subheading"
            selectable={false}>
              {text}
          </Text>
          {!isListItem && (
            <ChevronDownIcon
              mr="0"
              ml="5"
              size="xl"
              display="flex"
              alignSelf="center"
              justifySelf="flex-end"
              marginRight="0" />
        )}
        </Pressable>
  </>
)

const SelectListItem = (
  {
    chain,
    styles,
    press,
    isListItem
  }: {
    chain: string,
    styles: typeof show,
    press: () => void,
    isListItem: boolean
  }) => {
  const type = isListItem ? styles.list : styles.button
  return (
    <CustomSelectBox text={chain} press={press} styles={type} isListItem />
  )
}

//todo: add icon list (optional)
export const CustomSwitch = ({list, switchListCb}:{list:string[], switchListCb: () => void}) => {
  const [styleLeft, setStyleLeft] = useState<any>({
    show: false,
    style: hide
  })
  const [styleRight, setStyleRight] = useState<any>({
    show: false,
    style: hide
  })

  const [sourceList, setSourceList] = useState<string[]>(list);
  const [targetList, setTargetList] = useState<string[]>(list.slice().reverse());

  const toggleList = (left?: boolean) => {
    const side = left ? [styleLeft, setStyleLeft ] : [styleRight, setStyleRight ]  
    !side[0].show ? side[1]({ show: true, style: show }) : side[1]({ show: false, style: hide })
  }

  const switchSelect = () => {
    setSourceList(targetList);
    setTargetList(sourceList);
    switchListCb();
  }

  const selectFromList = (index: number, isLeft: boolean) => {
    const sides = [sourceList, targetList]
    const selectedSide = isLeft ? sides.splice(0, 1)[0] : sides.splice(1,1)[0]
    const altSide = sides[0]
    const selected = selectedSide.splice(index, index)[0]
    selectedSide.unshift(selected);
    if (altSide.indexOf(selected) === 0) {
      const altSelected = altSide.splice(index, index)[0]
      altSide.unshift(altSelected)
    }
    toggleList(isLeft);
    switchListCb(); //Todo: refactor to handle list with more then 2 values
  }

  return (
    <View height="16" display="flex" flexDirection="row" justifyContent="flex-start" alignItems="flex-start">
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        {
          sourceList.map((chain, index) => (
            <SelectListItem
              key={index}
              chain={index === 0 ? sourceList[0] : chain}
              styles={styleLeft.style}
              press={() => index === 0 ? toggleList(true) : selectFromList(index, true)}
              isListItem={index !== 0}
            />
          ))
        }
      </Box>
      <Box w="100px" height="64px" pl="3" pr="3" display="flex" justifyContent={"center"} alignItems="center">
        <Pressable onPress={switchSelect}>
          <Icon
            minWidth="8"
            size="xl"
            w="6"
            h="6"
            display="flex"
            alignSelf="center"
            justifyItems="center"
            pl="1.5"
            fill="none"
            viewBox="0 0 24 24">
              <SwitchIcon />
            </Icon>
        </Pressable>
      </Box>
      <Box display="flex" alignItems="center" justifyContent={"center"} flexDirection="column">
        {
          targetList.map((chain, index) => (
            <SelectListItem
              key={'target'+index}
              chain={index === 0 ? targetList[0] : chain}
              styles={styleRight.style}
              press={() => index === 0 ? toggleList(false) : selectFromList(index, false)}
              isListItem={index !== 0}
            />
          ))
        }
      </Box>
    </View>
  )
}