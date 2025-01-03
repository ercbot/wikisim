'use client';

import styles from './Button.module.scss';

import * as React from 'react';
import * as Utilities from './utilities';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'PRIMARY' | 'SECONDARY';
  isDisabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ theme = 'PRIMARY', isDisabled, children, className, ...rest }) => {
  let classNames = Utilities.classNames(styles.root, styles.primary, className);

  if (theme === 'SECONDARY') {
    classNames = Utilities.classNames(styles.root, styles.secondary, className);
  }

  if (isDisabled) {
    classNames = Utilities.classNames(styles.root, styles.disabled, className);

    return <div className={classNames}>{children}</div>;
  }

  return (
    <button className={classNames} role="button" tabIndex={0} disabled={isDisabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
