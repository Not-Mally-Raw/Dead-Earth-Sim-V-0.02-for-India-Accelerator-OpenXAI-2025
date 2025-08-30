import React from 'react';
export function Card({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
export function CardContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
export function CardHeader({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
export function CardTitle({ children, ...props }) {
  return <div {...props}>{children}</div>;
}
