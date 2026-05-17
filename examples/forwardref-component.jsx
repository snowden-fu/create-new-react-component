import React, { forwardRef } from 'react';
import styles from './TestComponent.module.css';

const TestComponent = forwardRef((props, ref) => {
    return (
        <div ref={ref} className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
});

export default TestComponent;
