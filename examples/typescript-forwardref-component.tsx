import React, { forwardRef } from 'react';
import styles from './TestComponent.module.css';

interface Props {}

const TestComponent = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
    return (
        <div ref={ref} className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
});

export default TestComponent;
