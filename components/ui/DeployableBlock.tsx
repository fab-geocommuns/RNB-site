'use client';

import React, { useState } from 'react';
import deployableStyle from '@/styles/deployableBlock.module.scss';

interface PanelProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export default function Panel({ title, className, children }: PanelProps) {
  const [openSection, setOpenSection] = useState<boolean>(false);
  const toggleSection = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setOpenSection(!openSection);
  };
  return (
    <>
      <div className={className ? deployableStyle[className] : ''}>
        <h2
          className={`${deployableStyle.sectionTitle} ${deployableStyle.sectionTitle__openable}`}
        >
          <a
            href="#"
            className={` ${deployableStyle.sectionToggler} ${openSection ? deployableStyle.sectionTogglerOpen : ''}`}
            onClick={(e) => toggleSection(e)}
          >
            <span className={deployableStyle.sectionTogglerIcon}>▸</span>
            {title}
          </a>
        </h2>
        {openSection && children}
      </div>
    </>
  );
}
