import React, { Component } from "react";
import styled, { css } from "styled-components";

function MaterialButtonPrimary(props) {
  return (
    <Container {...props}>
      <Caption>{props.name}</Caption>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  background-color: #2196F3;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-right: 16px;
  padding-left: 16px;
  min-width: 88px;
  width: 150px;
  height: 36px;
  border-radius: 100px;
  border-color: #000000;
  border-width: 0;
  border-style: solid;
  display: inline-block;
`;

const Caption = styled.span`
  font-family: Roboto;
  color: #fff;
  font-size: 14px;
`;

export default MaterialButtonPrimary;
