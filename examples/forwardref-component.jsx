import React from 'react';
import { forwardRef } from 'react';

const TestComponent = forwardRef((props, ref) => {
    return (
        <div ref={ref}>
            {/* Add your component content here */}
        </div>
    );
});

export default TestComponent; 