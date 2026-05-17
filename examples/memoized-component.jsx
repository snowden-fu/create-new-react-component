import React, { memo } from 'react';
import styles from './TestComponent.module.css';

const TestComponent = memo((props) => {
    return (
        <div className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
});

export default TestComponent;
