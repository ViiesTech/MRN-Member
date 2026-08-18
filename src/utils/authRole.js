export const isMemberUser = user =>
  `${user?.role ?? ''}`.trim().toLowerCase() === 'member';

export const showMemberAccountRequiredToast = showToast => {
  showToast(
    'Member account required',
    'This account belongs to the MRN Consumer app.',
    'error',
  );
};
