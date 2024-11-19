import { FormatQuote } from '@mui/icons-material';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { renderLog } from '../../common/utils/logging';

const ImageHandler = React.lazy(() => import(/* webpackChunkName: 'ImageHandler' */ '../ImageHandler'));


class Testimonial extends React.Component {
  shouldComponentUpdate (nextProps) {
    // This lifecycle method tells the component to NOT render if not needed
    if (this.props.testimonialAuthor !== nextProps.testimonialAuthor) {
      return true;
    }
    if (this.props.testimonial !== nextProps.testimonial) {
      return true;
    }
    if (this.props.imageUrl !== nextProps.imageUrl) {
      return true;
    }
    return false;
  }

  render () {
    renderLog('Testimonial');  // Set LOG_RENDER_EVENTS to log all renders
    const { testimonialAuthor, imageUrl, testimonial, textStyle } = this.props;
    return (
      <TestimonialContainer>
        <Suspense fallback={<></>}>
          <ImageHandler
            className="card-main__avatar__testimonial"
            imageUrl={imageUrl}
            alt=""
            kind_of_ballot_item="CANDIDATE"
          />
        </Suspense>
        <TestimonialAuthor id='testimonial_Author'>
          {testimonialAuthor}
        </TestimonialAuthor>
        <TextStyled
          id='testimonialText'
          style={textStyle}
        >
          <FormatQuote style={{
            transform: 'scaleX(-1)',
            verticalAlign: 'text-bottom',
            position: 'relative',
            top: '3px',
            // marginLeft: '-4px',
          }}
          />
          {testimonial}
          <span className="u-no-break">
            &nbsp;
            <FormatQuote style={{
              verticalAlign: 'text-bottom',
              position: 'relative',
              top: '3px',
              marginLeft: '-4px',
            }}
            />
          </span>
        </TextStyled>
      </TestimonialContainer>
    );
  }
}
Testimonial.propTypes = {
  testimonialAuthor: PropTypes.string,
  testimonial: PropTypes.string,
  imageUrl: PropTypes.string,
  textStyle: PropTypes.object,
};

const TestimonialContainer = styled('div')`
  display: block;
  float: right;
  background-color: white;
  border-radius: 4px;
  width: 100%;
  @media print{
    display: none;
  }
`;

const TestimonialAuthor = styled('div')`
  text-align: center;
  color: #999;
  font-style: italic;
  font-size: 10px;
`;

const TextStyled = styled('div')`
  display: block;
  color: #2e3c5d;
  font-weight: 600;
  font-family: ${'$heading-font-stack'};
  text-align: left;
  margin: 10px 0;
  border-width: medium;
  font-size: 14px;
  line-height: normal;
  :after {
    content: "";
    display: block;
    margin: 0 auto;
    width: 50%;
    padding-top: 15px;
    border-bottom: 2px solid;
  }
`;

export default Testimonial;
