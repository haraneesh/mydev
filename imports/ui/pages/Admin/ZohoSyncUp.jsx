import React from 'react';
import { Row, Col, Panel } from 'react-bootstrap';
import { syncBulkOrdersWithZoho, getOrdersAndInvoicesFromZoho } from '../../../api/ZohoSyncUps/zohoOrdersMethods';
import { bulkSyncProductsZoho } from '../../../api/ZohoSyncUps/zohoProductsMethods';
import { bulkSyncUsersZoho } from '../../../api/ZohoSyncUps/zohoContactsMethods';
import ZohoSync from '../../components/ZohoSync/ZohoSync';

const ZohoSyncUp = () => (
  <div>
    <h3 className="page-header">Sync With Zoho Books</h3>
    <Panel>
      <Row>
        <Col xs={12}>
          <ZohoSync
            orderSequence={1}
            syncFunction={bulkSyncUsersZoho}
            syncName="Sync Users >"
            syncDescription="Send user updates to Zoho"
          />

          <ZohoSync
            orderSequence={2}
            syncFunction={bulkSyncProductsZoho}
            syncName="Sync Products >"
            syncDescription="Send product updates to Zoho"
          />

          <ZohoSync
            orderSequence={3}
            syncFunction={syncBulkOrdersWithZoho}
            syncName="Send Pending Orders >"
            syncDescription="Send details of pending orders to Zoho and update status to Awaiting Fulfillment"
          />

          <hr />

          <ZohoSync
            orderSequence={4}
            syncFunction={getOrdersAndInvoicesFromZoho} // {getOrdersFromZoho}
            syncName="< Get Invoices "
            syncDescription="Get invoice details of orders from Zoho"
          />

        </Col>
      </Row>
    </Panel>
  </div>
);

export default ZohoSyncUp;
