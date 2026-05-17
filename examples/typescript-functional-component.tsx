import React from 'react';
import styles from './TestComponent.module.css';

interface Props {}

function TestComponent(props: Props) {
    return (
        <div className={styles.root}>
            {/* Add your component content here */}
        </div>
    );
}

export default TestComponent;
