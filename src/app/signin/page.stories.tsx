import type { Meta, StoryObj } from '@storybook/react';
import SignInPage from './page';

const meta: Meta<typeof SignInPage> = {
  title: 'Auth/SignInPage',
  component: SignInPage,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;

type Story = StoryObj<typeof SignInPage>;

export const Default: Story = {
  render: () => <SignInPage />,
};
