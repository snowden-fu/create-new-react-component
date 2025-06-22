import React from 'react';
import { forwardRef } from 'react';

interface Props {}

const TestComponent = forwardRef<HTMLDivElement, Props>((props: Props, ref) => {
    return (
        <div ref={ref}>
            {/* Add your component content here */}
        </div>
    );
});

export default TestComponent; 