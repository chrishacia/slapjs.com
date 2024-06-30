import React from 'react';
import { NavSidebar } from './NavSidebar';

type Props = {
    children: React.ReactNode;
    title?: string;
};

export const MainContent: React.FC<Props> = (props) => {
    const {children} = props;
    return (
        <div className="row flex-grow-1">
            <NavSidebar />
            <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                {children}
            </main>
        </div>
    );
};
