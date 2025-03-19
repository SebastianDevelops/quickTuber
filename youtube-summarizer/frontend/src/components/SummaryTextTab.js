import { Card, CardBody } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';

const SummaryTextTab = ({ summary }) => {
  return (
    <div className="summary-text-tab">
      <div className="export-actions">
      </div>
      
      
        <Card className="summary-card">
          <CardBody>
            <h2>Video Summary</h2>
            <div className="summary-content">
              {summary.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </CardBody>
        </Card>
    </div>
  );
};

export default SummaryTextTab;