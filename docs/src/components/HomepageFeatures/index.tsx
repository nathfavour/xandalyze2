import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Real-Time Monitoring',
    description: (
      <>
        Direct integration with Xandeum pRPC for live gossip network visibility, 
        tracking latency, uptime, and node status in real-time.
      </>
    ),
  },
  {
    title: 'AI-Powered Insights',
    description: (
      <>
        Leverage GitHub Models (gpt-4o-mini) for deep network analysis, 
        performance optimization, and natural language command processing.
      </>
    ),
  },
  {
    title: 'Professional UI/UX',
    description: (
      <>
        A resizable, multi-sidebar dashboard themed with official Xandeum 
        branding, designed for high data density and operator efficiency.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
