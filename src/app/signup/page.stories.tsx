import type { Meta, StoryObj } from '@storybook/react';
import SignUpPage from './page';

const meta: Meta<typeof SignUpPage> = {
  title: 'Auth/SignUpPage',
  component: SignUpPage,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof SignUpPage>;

export const Default: Story = {
  render: () => <SignUpPage />,
};
