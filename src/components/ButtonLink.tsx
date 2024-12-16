'use client';

import * as React from 'react';
import styles from './ButtonLink.module.scss';

interface ButtonLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ children, ...rest }) => {
  return (
    <button
      className={styles.root}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonLink; 