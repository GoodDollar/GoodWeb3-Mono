import React, { useState } from 'react'
import { Pressable, Icon, Text, ChevronDownIcon, View, Box } from 'native-base'

// import FuseLogo from '../../assets/svg/fuse.svg'
// import CeloLogo from '../../assets/svg/celo.svg'
// import SwitchIcon from ' ../../assets/svg/arrow-swap.svg'

// TODO: add fuse icon, and make imports from .svg work
export const CeloIcon = () => (
  <g>
  <path id="Bottom_Ring" fill="#FBCC5C" d="M375,850c151.9,0,275-123.1,275-275S526.9,300,375,300S100,423.1,100,575S223.1,850,375,850z
M375,950C167.9,950,0,782.1,0,575s167.9-375,375-375s375,167.9,375,375S582.1,950,375,950z"/>
         <path id="Top_Ring" fill="#35D07F" d="M575,650c151.9,0,275-123.1,275-275S726.9,100,575,100S300,223.1,300,375S423.1,650,575,650z
M575,750c-207.1,0-375-167.9-375-375S367.9,0,575,0s375,167.9,375,375S782.1,750,575,750z"/>
         <path id="Rings_Overlap" fill="#5EA33B" d="M587.4,750c26-31.5,44.6-68.4,54.5-108.1c39.6-9.9,76.5-28.5,108.1-54.5
c-1.4,45.9-11.3,91.1-29.2,133.5C678.5,738.7,633.3,748.6,587.4,750z M308.1,308.1c-39.6,9.9-76.5,28.5-108.1,54.5
c1.4-45.9,11.3-91.1,29.2-133.4c42.3-17.8,87.6-27.7,133.4-29.2C336.6,231.5,318,268.4,308.1,308.1z"/>
  </g>
)

const SwitchIcon = () => (
  <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
    <path d="m5 10.0909h14l-5.8396-5.0909" stroke="#B0B4BB"/>
    <path d="m19 13.9091h-14l5.8396 5.0909" stroke="#B0B4BB"/>
  </g>
)

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
          flexDirection={"row"}
          onPress={press}
          w={"40"}
          h="16"
          p="1"
          _hover={{ bgColor: "mainDarkContrast:alpha.20"}}>
          <Icon
            minWidth="8"
            size="xl"
            w="10"
            display="flex"
            alignSelf="center"
            justifyItems="center"
            pl="2"
            viewBox="0 0 950 950">
              <CeloIcon />
            </Icon>
          <Text
            textAlign="center"
            fontSize="lg"
            ml="0" w="105%"
            alignSelf="center"
            display="flex"
            pl="3"
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