import React, { useState } from 'react';

function withSteps(StepComponent, stepCollector) {
    return function (...props) {
        const steps = [];
        stepCollector.getSteps = () => {
            return steps;
        }
        return <StepComponent {...props} steps={steps} />;
    };
}

export default withSteps;