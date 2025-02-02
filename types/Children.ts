import React from "react";

export type Child =
  | string
  | number
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
export type Children = Child | Child[];
