import React from 'react';
import styles from './TestComponent.module.css';

class TestComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className={styles.root}>
                {/* Add your component content here */}
            </div>
        );
    }
}

export default TestComponent;
