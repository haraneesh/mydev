import React from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading/Loading';
import dailySummary from '../../../../reports/client/GenerateOPL';

export default class ReportDaysSummary extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: true,
      reportData: '',
    };
    this.generateReport = this.generateReport.bind(this);
  }

  componentDidMount() {
    this.generateReport();
  }

  generateReport() {
    Meteor.call('reports.generateDaySummary', (error, dailySummaryData) => {
      if (error) {
        toast.error(error.reason);
      } else {
        dailySummary(dailySummaryData);
        this.setState({ loading: false });
      }
    });
  }

  render() {
    const { loading } = this.state;
    return (!loading ? (
      <div> Done </div>
    ) : <Loading />);
  }
}
