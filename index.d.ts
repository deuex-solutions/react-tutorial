import { ReactNode } from 'react';

declare module '@deuex-solutions/react-tour' {
    export interface ReactProps {
        disableDotsNavigation: boolean;
        disableKeyboardNavigation: boolean;
        showCloseButton: boolean;
        showNumber: boolean;
        accentColor: string;
        inViewThreshold: number;
        lastStepNextButton: ReactNode;
        maskColor: string;
        playTour: boolean;
        stepWaitTimer: number;
        steps: Array<TourSteps>;
        onRequestClose: () => void;
        onRequestSkip: () => void;
    }

    export interface TourSteps {
        content?: string | React.ReactNode;
        actionType?: string;
        position?: string | number[];
        selector?: string;
        userTypeText?: string;
        waitTimer?: number;
    }

    const ReactTutorial: React.FC<ReactProps>;

    export default ReactTutorial;
}
